import time
from functools import wraps

def measure_runtime(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.perf_counter()
        result = func(*args, **kwargs)
        end_time = time.perf_counter()
        runtime = end_time - start_time
        runtime *= 1000
        return result if isinstance(result, tuple) else (result, runtime)
    return wrapper
