"""initial schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-10-07 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Admins
    op.create_table(
        'admins',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False, server_default='admin'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_admins_id'), 'admins', ['id'], unique=False)
    op.create_index(op.f('ix_admins_email'), 'admins', ['email'], unique=True)

    # 2. Categories
    op.create_table(
        'categories',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('slug', sa.String(length=120), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('icon', sa.String(length=255), nullable=True),
        sa.Column('image', sa.String(length=255), nullable=True),
        sa.Column('display_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_categories_id'), 'categories', ['id'], unique=False)
    op.create_index(op.f('ix_categories_slug'), 'categories', ['slug'], unique=True)

    # 3. Menu Items
    op.create_table(
        'menu_items',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('slug', sa.String(length=180), nullable=False),
        sa.Column('short_description', sa.String(length=255), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('price', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('image_url', sa.String(length=255), nullable=True),
        sa.Column('rating', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('review_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_available', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('is_featured', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('is_popular', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('is_bestseller', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('display_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('preparation_time', sa.String(length=50), nullable=True),
        sa.Column('tags', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_menu_items_id'), 'menu_items', ['id'], unique=False)
    op.create_index(op.f('ix_menu_items_category_id'), 'menu_items', ['category_id'], unique=False)
    op.create_index(op.f('ix_menu_items_slug'), 'menu_items', ['slug'], unique=True)
    op.create_index(op.f('ix_menu_items_is_available'), 'menu_items', ['is_available'], unique=False)
    op.create_index(op.f('ix_menu_items_is_active'), 'menu_items', ['is_active'], unique=False)

    # 4. Banners
    op.create_table(
        'banners',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('title', sa.String(length=150), nullable=False),
        sa.Column('subtitle', sa.String(length=200), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('image_url', sa.String(length=255), nullable=False),
        sa.Column('button_text', sa.String(length=50), nullable=True),
        sa.Column('button_link', sa.String(length=255), nullable=True),
        sa.Column('display_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('start_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('end_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_banners_id'), 'banners', ['id'], unique=False)
    op.create_index(op.f('ix_banners_is_active'), 'banners', ['is_active'], unique=False)

    # 5. Staff
    op.create_table(
        'staff',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('employee_code', sa.String(length=50), nullable=False),
        sa.Column('profile_image', sa.String(length=255), nullable=True),
        sa.Column('designation', sa.String(length=100), nullable=False),
        sa.Column('average_rating', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('total_ratings', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_staff_id'), 'staff', ['id'], unique=False)
    op.create_index(op.f('ix_staff_employee_code'), 'staff', ['employee_code'], unique=True)
    op.create_index(op.f('ix_staff_is_active'), 'staff', ['is_active'], unique=False)

    # 6. Locations
    op.create_table(
        'locations',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('location_type', sa.String(length=50), nullable=False, server_default='TABLE'),
        sa.Column('table_number', sa.String(length=50), nullable=True),
        sa.Column('room_number', sa.String(length=50), nullable=True),
        sa.Column('qr_token', sa.String(length=100), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_locations_id'), 'locations', ['id'], unique=False)
    op.create_index(op.f('ix_locations_qr_token'), 'locations', ['qr_token'], unique=True)
    op.create_index(op.f('ix_locations_is_active'), 'locations', ['is_active'], unique=False)

    # 7. QR Codes
    op.create_table(
        'qr_codes',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('location_id', sa.Integer(), nullable=False),
        sa.Column('token', sa.String(length=100), nullable=False),
        sa.Column('qr_image_url', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['location_id'], ['locations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_qr_codes_id'), 'qr_codes', ['id'], unique=False)
    op.create_index(op.f('ix_qr_codes_token'), 'qr_codes', ['token'], unique=True)
    op.create_index(op.f('ix_qr_codes_location_id'), 'qr_codes', ['location_id'], unique=False)

    # 8. Reviews
    op.create_table(
        'reviews',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('customer_name', sa.String(length=100), nullable=True),
        sa.Column('customer_identifier', sa.String(length=100), nullable=False),
        sa.Column('review_type', sa.String(length=50), nullable=False, server_default='RESTAURANT'),
        sa.Column('menu_item_id', sa.Integer(), nullable=True),
        sa.Column('staff_id', sa.Integer(), nullable=True),
        sa.Column('location_id', sa.Integer(), nullable=True),
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('review_text', sa.Text(), nullable=True),
        sa.Column('is_approved', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('is_visible', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint('rating >= 1 AND rating <= 5', name='check_rating_range'),
        sa.ForeignKeyConstraint(['location_id'], ['locations.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['menu_item_id'], ['menu_items.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['staff_id'], ['staff.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_reviews_id'), 'reviews', ['id'], unique=False)
    op.create_index(op.f('ix_reviews_customer_identifier'), 'reviews', ['customer_identifier'], unique=False)
    op.create_index(op.f('ix_reviews_menu_item_id'), 'reviews', ['menu_item_id'], unique=False)
    op.create_index(op.f('ix_reviews_staff_id'), 'reviews', ['staff_id'], unique=False)
    op.create_index(op.f('ix_reviews_location_id'), 'reviews', ['location_id'], unique=False)
    op.create_index(op.f('ix_reviews_is_approved'), 'reviews', ['is_approved'], unique=False)
    op.create_index(op.f('ix_reviews_is_visible'), 'reviews', ['is_visible'], unique=False)

    # 9. Review Images
    op.create_table(
        'review_images',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('review_id', sa.Integer(), nullable=False),
        sa.Column('image_url', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['review_id'], ['reviews.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_review_images_id'), 'review_images', ['id'], unique=False)
    op.create_index(op.f('ix_review_images_review_id'), 'review_images', ['review_id'], unique=False)

    # 10. Menu Versions
    op.create_table(
        'menu_versions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('key', sa.String(length=50), nullable=False, server_default='global'),
        sa.Column('version', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_menu_versions_id'), 'menu_versions', ['id'], unique=False)
    op.create_index(op.f('ix_menu_versions_key'), 'menu_versions', ['key'], unique=True)


def downgrade() -> None:
    op.drop_table('menu_versions')
    op.drop_table('review_images')
    op.drop_table('reviews')
    op.drop_table('qr_codes')
    op.drop_table('locations')
    op.drop_table('staff')
    op.drop_table('banners')
    op.drop_table('menu_items')
    op.drop_table('categories')
    op.drop_table('admins')
