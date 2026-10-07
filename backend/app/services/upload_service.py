import os
import uuid
from abc import ABC, abstractmethod
from fastapi import UploadFile
from app.core.config import settings
from app.utils.validators import validate_image_file


class UploadService(ABC):
    @abstractmethod
    async def upload_image(self, file: UploadFile, subfolder: str) -> str:
        """Uploads an image and returns the public accessible URL."""
        pass

    @abstractmethod
    def delete_image(self, image_url: str) -> bool:
        """Deletes an image by its URL/path."""
        pass


class LocalUploadService(UploadService):
    def __init__(self, base_dir: str = None):
        self.base_dir = base_dir or settings.UPLOAD_DIR

    async def upload_image(self, file: UploadFile, subfolder: str) -> str:
        # Read file contents into memory for validation
        content = await file.read()
        validate_image_file(file, content)

        # Create target subfolder if not existing
        target_dir = os.path.join(self.base_dir, subfolder)
        os.makedirs(target_dir, exist_ok=True)

        # Generate unique filename
        original_ext = os.path.splitext(file.filename or "")[1].lower()
        if not original_ext:
            original_ext = ".jpg"
        unique_name = f"{uuid.uuid4().hex[:16]}{original_ext}"
        destination_path = os.path.join(target_dir, unique_name)

        # Write to disk
        with open(destination_path, "wb") as f:
            f.write(content)

        # Return web-accessible URL
        return f"/uploads/{subfolder}/{unique_name}"

    def delete_image(self, image_url: str) -> bool:
        if not image_url or not image_url.startswith("/uploads/"):
            return False

        rel_path = image_url.lstrip("/uploads/")
        file_path = os.path.join(self.base_dir, rel_path)
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                return True
            except OSError:
                return False
        return False


# Singleton upload service instance
upload_service: UploadService = LocalUploadService()
