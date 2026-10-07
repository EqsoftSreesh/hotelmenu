from typing import Optional, List, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.category import Category
from app.models.menu_item import MenuItem
from app.repositories.base import BaseRepository


class CategoryRepository(BaseRepository[Category]):
    def __init__(self, db: Session):
        super().__init__(Category, db)

    def get_by_slug(self, slug: str) -> Optional[Category]:
        return self.db.query(Category).filter(Category.slug == slug).first()

    def get_by_name(self, name: str) -> Optional[Category]:
        return self.db.query(Category).filter(func.lower(Category.name) == name.lower()).first()

    def get_active_categories(self) -> List[Category]:
        return (
            self.db.query(Category)
            .filter(Category.is_active == True)
            .order_by(Category.display_order.asc(), Category.name.asc())
            .all()
        )

    def get_all_admin(self, skip: int = 0, limit: int = 100) -> List[Category]:
        return (
            self.db.query(Category)
            .order_by(Category.display_order.asc(), Category.id.asc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def reorder(self, reorder_list: List[Dict[str, int]]) -> None:
        for item in reorder_list:
            cat = self.get_by_id(item["id"])
            if cat:
                cat.display_order = item["display_order"]
        self.db.commit()

    def get_item_count(self, category_id: int) -> int:
        return (
            self.db.query(MenuItem)
            .filter(MenuItem.category_id == category_id, MenuItem.is_active == True)
            .count()
        )
