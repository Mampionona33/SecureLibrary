from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView,
    UserDeleteView,
    UserListView,
    UserDetailView,
    EmailTokenObtainPairView,
    CurrentUserView,
    GroupViewSet,
    CustomTokenRefreshView,
    LogoutView  # 👈 Ajouter cet import
)

router = DefaultRouter()
router.register(r'groups', GroupViewSet, basename='group')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='user-register'),
    path('login/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),  # 👈 Ajouter cette ligne
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('', UserListView.as_view(), name='user-list'),
    path('<uuid:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('<uuid:pk>/delete/', UserDeleteView.as_view(), name='user-delete'),
    path('', include(router.urls)),
]
