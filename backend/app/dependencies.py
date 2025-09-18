from .services.content_service import content_service
from .services.judge_service import judge_service
from .services.execution_service import execution_service
from .services.user_service import user_service


def get_content_service():
    return content_service


def get_user_service():
    return user_service


def get_judge_service():
    return judge_service



def get_execution_service():
    return execution_service
