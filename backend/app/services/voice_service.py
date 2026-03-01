import os
import logging

try:
    from google.cloud import speech
    _speech_available = True
except ImportError:
    speech = None
    _speech_available = False

logger = logging.getLogger(__name__)

async def transcribe_audio(audio_data: bytes) -> str:
    """
    Synchronously calls Google Cloud Speech-to-Text API.
    """
    if not _speech_available:
        raise ValueError("google-cloud-speech is not installed. Run: pip install google-cloud-speech")

    if not os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
        logger.warning("GOOGLE_APPLICATION_CREDENTIALS not set. STT will fail.")
        raise ValueError("Google Cloud credentials not configured on backend.")

    try:
        # Initialize client
        client = speech.SpeechClient()

        # Audio construct
        audio = speech.RecognitionAudio(content=audio_data)

        # Configuration
        # We assume the frontend sends webm/opus or similar.
        # WEBM_OPUS is the standard for browser MediaRecorder.
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
            sample_rate_hertz=48000, # common browser default, but API handles mismatches surprisingly well
            language_code="en-US",
            enable_automatic_punctuation=True,
            model="default" # Or "latest_long"
        )

        # Detects speech in the audio file
        response = client.recognize(config=config, audio=audio)

        transcript = ""
        for result in response.results:
            transcript += result.alternatives[0].transcript

        return transcript.strip()

    except Exception as e:
        logger.error(f"Google Cloud STT Error: {str(e)}")
        raise e
