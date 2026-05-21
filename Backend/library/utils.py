from cryptography.fernet import Fernet
from django.conf import settings

fernet = Fernet(settings.PDF_ENCRYPTION_KEY)

def encrypt_data(data: bytes) -> bytes:
    return fernet.encrypt(data)

def decrypt_data(data: bytes) -> bytes:
    return fernet.decrypt(data)