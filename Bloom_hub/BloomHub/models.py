from django.contrib.auth.models import AbstractBaseUser, BaseUserManager,PermissionsMixin
from django.db import models


class BloomUserManager(BaseUserManager):
    def create_user(self, user_id, username, password=None, **extra_fields):
        if not user_id:
            raise ValueError('The User ID is required')
        user = self.model(user_id=user_id, username=username, **extra_fields)
        user.set_password(password)  # 비밀번호 해시화 처리
        user.save(using=self._db)
        return user

    def create_superuser(self, user_id, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(user_id=user_id, username=user_id, email=email, password=password, **extra_fields)

class BloomUser(AbstractBaseUser, PermissionsMixin):
    user_id = models.CharField(max_length=50, unique=True)
    username = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    youtube_api_key = models.CharField(max_length=255, blank=True, null=True)
    wikifier_api_key = models.CharField(max_length=255, blank=True, null=True)
    profileImg = models.ImageField(upload_to='profiles/', blank=True, null=True)

      # 추가된 필드
    is_staff = models.BooleanField(default=False)  # Staff status
    is_superuser = models.BooleanField(default=False)  # Superuser status

    USERNAME_FIELD = 'user_id'
    REQUIRED_FIELDS = ['email']

    objects = BloomUserManager()

    def __str__(self):
        return self.username
    

################유튜브 영상 DB####################
from django.db import models
from django.conf import settings

class LearningVideo(models.Model):
    title = models.CharField(max_length=255)
    vid = models.URLField()  # YouTube 영상 링크 저장
    setTime = models.IntegerField()  # 영상 길이 (초 단위)
    uploader = models.CharField(max_length=255)  # 영상 업로더
    view_count = models.IntegerField()  # 조회수
    std_lang = models.CharField(max_length=2, choices=[('KR', 'Korean'), ('EN', 'English')])  # 지원 언어
    learning_status = models.BooleanField(default=False)  # 학습 여부, 기본값 False
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # 학습한 사용자

    def __str__(self):
        return self.title


# # 유튜브 비디오 모델 정의
# class YouTubeVideo(models.Model):
#     link = models.URLField()
#     title = models.CharField(max_length=200)
#     channel_name = models.CharField(max_length=100)
#     duration = models.PositiveIntegerField()  # 영상 길이 (초 단위)
#     is_learned = models.BooleanField(default=False)

# # 학습된 비디오 모델 정의
# class LearnedVideo(models.Model):
#     youtube_video = models.ForeignKey(YouTubeVideo, on_delete=models.CASCADE)
#     subtitle_language = models.CharField(max_length=10, choices=[('KR', '한국어'), ('EN', '영어')])
#     nouns = models.JSONField()  # 명사 5개
#     bloom_sections = models.JSONField()  # Bloom 단계별 구간 리스트
#     plotly_graphs = models.JSONField()  # Plotly 그래프 2종
