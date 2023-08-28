import time
from globals import Globals

def measure_time(start_time):
        end_time = time.time()
        elapsed_time = end_time - start_time
        return elapsed_time

#This logs results based on the level of the log set in the config file
def log_result(result):
        level = Globals.logging_level
        if level == "logging.DEBUG":
                return {
			"Execution Time (s)": result.get("Execution Time"),
			"Token Count": result.get("Token Count"),
			"Timestamp": result.get("Timestamp"),
			"Execution Time": result.get("Execution Time"),
                        "Class Name": result.get("Class Name"),
                        "Prompts":  result.get("Prompt"),
                        "Intermediate Steps": result.get("Steps")
                    }
        elif level == "logging.INFO":
                return {
			"Execution Time": result.get("Execution Time"),
                        "Prompts":  result.get("Prompt")
                    }
        elif level == "logging.ERROR":
               return {
		 "Errors": result.get("Errors")
                    }
        else:
              return result