"""
WildGuard AI - Software-Based Audio Alarm Module
=================================================
A high-performance, non-blocking audio alarm player using Pygame Mixer.
Ensures real-time video inference and telemetry loops never lag or freeze.
"""

import os
import sys
import time
import math
import wave
import struct
import io
import threading
from typing import Optional

# Set safe UTF-8 encoding on standard streams if supported on Windows
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
if sys.stderr and hasattr(sys.stderr, "reconfigure"):
    try:
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Suppress Pygame support prompt to keep inference logs clean
os.environ["PYGAME_HIDE_SUPPORT_PROMPT"] = "1"

try:
    import pygame
    PYGAME_AVAILABLE = True
except ImportError:
    PYGAME_AVAILABLE = False


def generate_siren_wav(
    filepath: Optional[str] = None,
    duration: float = 1.6,
    sample_rate: int = 44100
) -> bytes:
    """
    Synthesize an emergency acoustic siren audio waveform.
    Uses frequency modulation between 850Hz and 1350Hz.
    Saves to filepath if provided, and returns raw WAV bytes.
    """
    num_samples = int(sample_rate * duration)
    raw_data = bytearray()

    for i in range(num_samples):
        t = float(i) / sample_rate
        # Frequency modulation between 850Hz and 1350Hz (warble cycle ~ 0.3s)
        freq = 1100.0 + 250.0 * math.sin(2.0 * math.pi * 3.33 * t)
        phase = 2.0 * math.pi * freq * t

        # Dual-harmonic blend for penetrating alarm acoustics
        sample = 0.75 * math.sin(phase) + 0.25 * math.sin(2.0 * phase)
        int_sample = max(-32768, min(32767, int(sample * 26000)))
        raw_data.extend(struct.pack("<h", int_sample))

    wav_io = io.BytesIO()
    with wave.open(wav_io, "wb") as wf:
        wf.setnchannels(1)       # Mono
        wf.setsampwidth(2)       # 16-bit
        wf.setframerate(sample_rate)
        wf.writeframes(raw_data)

    wav_bytes = wav_io.getvalue()

    if filepath:
        os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
        with open(filepath, "wb") as f:
            f.write(wav_bytes)

    return wav_bytes


class AudioAlarm:
    """
    Non-blocking Audio Alarm Player using Pygame Mixer.

    Features:
    - Thread-safe, asynchronous playback that never blocks the video feed.
    - Configurable cooldown window (default: 5.0 seconds).
    - Auto-synthesized acoustic emergency siren fallback if no audio file is provided.
    - Graceful fallback when running in headless / audio-disabled environments.
    """

    def __init__(
        self,
        sound_file: Optional[str] = None,
        cooldown_seconds: float = 5.0,
        volume: float = 1.0,
        auto_generate_siren: bool = True
    ):
        self.cooldown_seconds = float(cooldown_seconds)
        self.volume = max(0.0, min(1.0, float(volume)))
        self.last_alarm_time = 0.0
        self._lock = threading.Lock()
        self.sound = None
        self.initialized = False
        self.sound_file = sound_file

        if not PYGAME_AVAILABLE:
            print("[AudioAlarm] WARNING: 'pygame' is not installed. Audio alerts will be logged to console only.")
            return

        self._init_mixer(auto_generate_siren)

    def _init_mixer(self, auto_generate_siren: bool):
        """Initialize the Pygame mixer and load or synthesize the alert sound."""
        try:
            if not pygame.mixer.get_init():
                pygame.mixer.init(frequency=44100, size=-16, channels=2, buffer=512)

            # Allocate dedicated channel for high priority alarm
            pygame.mixer.set_num_channels(8)

            sound_loaded = False

            # Check if a specific sound file was requested and exists
            if self.sound_file and os.path.isfile(self.sound_file):
                try:
                    self.sound = pygame.mixer.Sound(self.sound_file)
                    self.sound.set_volume(self.volume)
                    sound_loaded = True
                    print(f"[AudioAlarm] Loaded custom alarm sound: {self.sound_file}")
                except Exception as e:
                    print(f"[AudioAlarm] WARNING: Could not load sound file '{self.sound_file}': {e}")

            # Fallback to default sounds/alarm.wav if it exists
            default_wav_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sounds", "alarm.wav")
            if not sound_loaded and os.path.isfile(default_wav_path):
                try:
                    self.sound = pygame.mixer.Sound(default_wav_path)
                    self.sound.set_volume(self.volume)
                    sound_loaded = True
                    self.sound_file = default_wav_path
                    print(f"[AudioAlarm] Loaded default alarm sound: {default_wav_path}")
                except Exception as e:
                    print(f"[AudioAlarm] WARNING: Could not load default alarm sound: {e}")

            # Synthesize emergency siren if no audio file available
            if not sound_loaded and auto_generate_siren:
                try:
                    wav_bytes = generate_siren_wav(filepath=default_wav_path)
                    self.sound = pygame.mixer.Sound(io.BytesIO(wav_bytes))
                    self.sound.set_volume(self.volume)
                    self.sound_file = default_wav_path
                    sound_loaded = True
                    print(f"[AudioAlarm] Generated synthesized acoustic siren: {default_wav_path}")
                except Exception as e:
                    print(f"[AudioAlarm] WARNING: Siren synthesis failed: {e}")

            self.initialized = sound_loaded
        except Exception as e:
            print(f"[AudioAlarm] WARNING: Could not initialize audio device: {e}")
            self.initialized = False

    def trigger_alarm(self, force: bool = False) -> bool:
        """
        Trigger the alarm if the cooldown period has elapsed.
        This call is strictly non-blocking.

        Args:
            force: If True, bypass the cooldown check.

        Returns:
            bool: True if alarm was triggered, False if blocked by cooldown or uninitialized.
        """
        now = time.time()
        with self._lock:
            elapsed = now - self.last_alarm_time
            if not force and elapsed < self.cooldown_seconds:
                return False

            self.last_alarm_time = now

        # Dispatch playback asynchronously in background thread for zero-latency guarantee
        threading.Thread(target=self._play_sound_worker, daemon=True).start()
        return True

    def _play_sound_worker(self):
        """Worker executing non-blocking playback."""
        try:
            if self.sound is not None:
                # pygame.mixer.Sound.play() plays asynchronously in Pygame's background C thread
                self.sound.play()
            else:
                # Console alert fallback
                print("[AudioAlarm] [SIREN] Acoustic Alarm Triggered (Simulated)")
        except Exception as e:
            print(f"[AudioAlarm] ERROR during playback: {e}")

    def is_cooling_down(self) -> bool:
        """Check whether the alarm is currently in the cooldown period."""
        return (time.time() - self.last_alarm_time) < self.cooldown_seconds

    def get_cooldown_remaining(self) -> float:
        """Return the number of seconds remaining in the cooldown period."""
        remaining = self.cooldown_seconds - (time.time() - self.last_alarm_time)
        return max(0.0, remaining)

    def stop(self):
        """Stop any currently playing alarm sound."""
        try:
            if self.sound is not None:
                self.sound.stop()
        except Exception as e:
            print(f"[AudioAlarm] ERROR stopping sound: {e}")

    def set_volume(self, volume: float):
        """Set playback volume between 0.0 and 1.0."""
        self.volume = max(0.0, min(1.0, float(volume)))
        if self.sound:
            self.sound.set_volume(self.volume)


# Global default alarm instance
_default_alarm: Optional[AudioAlarm] = None

def get_alarm_instance(cooldown_seconds: float = 5.0) -> AudioAlarm:
    """Get or create the singleton AudioAlarm instance."""
    global _default_alarm
    if _default_alarm is None:
        _default_alarm = AudioAlarm(cooldown_seconds=cooldown_seconds)
    return _default_alarm

def sound_alarm(cooldown_seconds: float = 5.0) -> bool:
    """Convenience function to trigger the alarm with non-blocking execution."""
    return get_alarm_instance(cooldown_seconds).trigger_alarm()


if __name__ == "__main__":
    print("Testing AudioAlarm module...")
    alarm = AudioAlarm(cooldown_seconds=3.0)
    print("Trigger 1 (initial):", alarm.trigger_alarm())
    time.sleep(1.0)
    print(f"Trigger 2 (within cooldown): {alarm.trigger_alarm()} | Remaining: {alarm.get_cooldown_remaining():.1f}s")
    time.sleep(2.2)
    print("Trigger 3 (after cooldown):", alarm.trigger_alarm())
    time.sleep(1.5)
    print("Test completed successfully.")
