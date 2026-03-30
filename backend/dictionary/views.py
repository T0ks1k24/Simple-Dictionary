from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Word
from .serializers import WordSerializer
import random

class WordViewSet(viewsets.ModelViewSet):
    serializer_class = WordSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['word', 'translation']

    def get_queryset(self):
        return Word.objects.filter(user=self.request.user).order_by('word')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def play(self, request):
        count = int(request.query_params.get('count', 10))
        queryset = self.get_queryset()
        total = queryset.count()
        count = min(count, total)
        
        words = list(queryset)
        random_words = random.sample(words, count)
        
        serializer = self.get_serializer(random_words, many=True)
        return Response(serializer.data)
