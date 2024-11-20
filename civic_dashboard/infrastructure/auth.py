from rest_framework import permissions

class IsAnalystOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.groups.filter(name__in=['Analyst', 'Admin']).exists()

class IsAdminOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.groups.filter(name='Admin').exists()