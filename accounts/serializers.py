from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import ValidationError

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        email = attrs.get(self.username_field, '').strip()
        password = attrs.get('password', '')
        user = User.objects.filter(email__iexact=email).first()
        
        if user and user.check_password(password):
            if user.status == 'suspended':
                raise ValidationError("Account is suspended.")
            
            refresh = self.get_token(user)
            data = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'role': user.role,
                    'status': user.status,
                    'allowed_modules': user.allowed_modules or [],
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                }
            }
            return data
            
        return super().validate(attrs)

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['id'] = str(user.id)
        token['email'] = user.email  
        token['role'] = user.role
        token['status'] = user.status
        token['allowed_modules'] = user.allowed_modules or []
        return token

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'first_name', 'last_name', 'role')

    def validate_role(self, value):
        if value == 'admin':
            raise ValidationError("400 Bad Request: Cannot register with admin privileges.")
        return value

    def create(self, validated_data):
        role = validated_data.get('role', 'purchaser')
        
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=role,
            status='active'
        )
        return user