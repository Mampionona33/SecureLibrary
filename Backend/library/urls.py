from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookViewSet

router = DefaultRouter()
router.register(r'library', BookViewSet, basename='book')

urlpatterns = [
    path('', include(router.urls)),
]