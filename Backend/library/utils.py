from cryptography.fernet import Fernet
from django.conf import settings

def get_fernet():
    return Fernet(settings.PDF_ENCRYPTION_KEY)

def encrypt_data(data):
    f = get_fernet()
    return f.encrypt(data)

def decrypt_data(data):
    f = get_fernet()
    return f.decrypt(data)