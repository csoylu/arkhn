from django.shortcuts import render
from django.http import JsonResponse
import docker
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from functools import wraps
from typing import Any, Dict, List, Optional
from contextlib import contextmanager
import time

@contextmanager
def docker_client():
    """Context manager for Docker client."""
    client = docker.from_env()
    try:
        yield client
    finally:
        client.close()

def handle_docker_errors(f):
    """Decorator to handle Docker-related errors."""
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except docker.errors.NotFound as e:
            return JsonResponse({'error': str(e)}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return wrapper

@require_http_methods(["GET", "POST"])
@csrf_exempt
@handle_docker_errors
def manage_images(request):
    with docker_client() as client:
        if request.method == "GET":
            images = client.images.list()
            return JsonResponse([
                {
                    'id': image.id,
                    'tags': image.tags,
                    'labels': image.labels,
                    'created': image.attrs['Created'],
                    'size': image.attrs['Size']
                } for image in images
            ], safe=False)
        
        elif request.method == "POST":
            image = request.POST.get('image')
            if not image:
                return JsonResponse({'error': 'Image name is required'}, status=400)
            client.images.pull(image)
            return JsonResponse({'message': 'Image pulled successfully'}, status=200)

@require_http_methods(["GET", "POST"])
@csrf_exempt
@handle_docker_errors
def manage_containers(request):
    with docker_client() as client:
        if request.method == "GET":
            containers = client.containers.list(all=True)
            return JsonResponse([
                {
                    'id': container.id,
                    'name': container.name,
                    'status': container.status,
                    'image': container.image.tags[0] if container.image.tags else None
                } for container in containers
            ], safe=False)
        
        elif request.method == "POST":
            image = request.POST.get('image')
            command = request.POST.get('command', '')
            name = request.POST.get('name', f'container-{int(time.time())}')
            
            if not image:
                return JsonResponse({'error': 'Image name is required'}, status=400)
                
            container = client.containers.run(
                image=image,
                command=command,
                name=name,
                detach=True
            )
            return JsonResponse({
                'message': 'Container created successfully',
                'container_id': container.id
            }, status=201)

@require_http_methods(["GET", "PUT", "DELETE"])
@csrf_exempt
@handle_docker_errors
def manage_container(request, container_id: str):
    with docker_client() as client:
        container = client.containers.get(container_id)
        
        if request.method == "GET":
            return JsonResponse({
                'id': container.id,
                'name': container.name,
                'status': container.status,
                'image': container.image.tags[0] if container.image.tags else None
            })
            
        elif request.method == "PUT":
            status = request.POST.get('status')
            if status == 'running':
                container.start()
                return JsonResponse({'message': 'Container started successfully'})
            elif status == 'stopped':
                container.stop()
                return JsonResponse({'message': 'Container stopped successfully'})
            return JsonResponse({'error': 'Invalid status'}, status=400)
                
        elif request.method == "DELETE":
            container.remove(force=True)
            return JsonResponse({'message': 'Container removed successfully'})

@handle_docker_errors
def get_docker_container_logs(request, container_id: str):
    with docker_client() as client:
        container = client.containers.get(container_id)
        logs = container.logs(tail=100).decode('utf-8')
        return JsonResponse({
            'status': 'success',
            'logs': logs.split('\n')[::-1]  # Reverse the logs
        }, status=200)
