from django.urls import path
from . import views

urlpatterns = [
    path('images', views.manage_images, name='manage_images'),
    path('containers', views.manage_containers, name='manage_containers'),
    path('containers/<str:container_id>', views.manage_container, name='manage_container'),
    path('containers/<str:container_id>/logs', views.get_docker_container_logs, name='get_docker_container_logs'),
]
