import os
import secrets
import qrcode
from PIL import Image


def generate_secure_token(nbytes: int = 12) -> str:
    """Generates a cryptographically secure URL-safe token."""
    return secrets.token_urlsafe(nbytes)


def create_qr_code_image(token: str, base_url: str, output_dir: str) -> str:
    """
    Generates a QR code image encoding the customer menu URL:
    {base_url}/menu/{token}
    Saves the image into output_dir and returns the relative file path.
    """
    menu_url = f"{base_url.rstrip('/')}/menu/{token}"
    os.makedirs(output_dir, exist_ok=True)
    filename = f"qr_{token}.png"
    file_path = os.path.join(output_dir, filename)

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(menu_url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    img.save(file_path)

    return f"/uploads/qrcodes/{filename}"
