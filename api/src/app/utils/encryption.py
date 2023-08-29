from globals import Globals
from cryptography.fernet import Fernet

class Encryption:
    key_str = Globals.ENCRYPTION_KEY
    key = key_str.encode()

    def encrypt(data):
        fernet = Fernet(Encryption.key)
        return fernet.encrypt(data.encode()).decode()

    def decrypt(data):
        fernet = Fernet(Encryption.key)
        return fernet.decrypt(data.encode()).decode()