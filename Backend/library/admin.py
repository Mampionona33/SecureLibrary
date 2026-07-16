from django.contrib import admin
from .models import Book, Category

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'created_at')
    list_filter = ('parent',)
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'status', 'added_by', 'created_at')
    list_filter = ('status', 'category', 'added_by')
    search_fields = ('title', 'author', 'isbn')
