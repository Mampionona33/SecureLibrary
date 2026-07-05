from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    UserDeleteView,
    UserListView,
    UserUpdateView,
    UserDetailView,
    EmailTokenObtainPairView,
    CurrentUserView, # <-- On importe notre nouvelle vue
)

urlpatterns = [
    path("", UserListView.as_view(), name="list_users"),
    path("register/", RegisterView.as_view(), name="register"),
    path("me/", CurrentUserView.as_view(), name="current_user"),  
    path("<uuid:pk>/", UserDetailView.as_view(), name="detail_user"),
    path("<uuid:pk>/delete/", UserDeleteView.as_view(), name="delete_user"),
    path("<uuid:pk>/update/", UserUpdateView.as_view(), name="update_user"),
    path("login/", EmailTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
