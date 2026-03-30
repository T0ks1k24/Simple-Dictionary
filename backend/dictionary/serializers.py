from rest_framework import serializers
from .models import Word

class WordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Word
        fields = [
            'id', 'user', 'word', 'translation',
            'times_played', 'correct_answers', 'incorrect_answers'
        ]
        read_only_fields = ['id', 'user']
