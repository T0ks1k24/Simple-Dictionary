from django.db import models
from users.models import User


class Word(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    word = models.CharField(max_length=255)
    translation = models.CharField(max_length=255)

    # Game stats
    times_played = models.PositiveIntegerField(default=0)
    correct_answers = models.PositiveIntegerField(default=0)
    incorrect_answers = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['word']
        indexes = [
            models.Index(fields=['user', 'word']),
        ]
