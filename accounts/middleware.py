from django.http import JsonResponse
import jwt

class AccountStatusMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                # ZERO-QUERY INTERCEPTION: Decode payload instantly without hitting the database
                payload = jwt.decode(token, options={"verify_signature": False})
                status = payload.get('status')
                
                # Instantly revoke access if suspended
                if status == 'suspended':
                    return JsonResponse(
                        {'error': 'Account is suspended. Access denied.'},
                        status=403
                    )
            except jwt.DecodeError:
                pass # Invalid tokens will be caught and rejected by DRF's authentication classes downstream

        return self.get_response(request)