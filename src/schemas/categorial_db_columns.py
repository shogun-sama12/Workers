from enum import Enum

class ExperienceLevel(str,Enum):
    junior = "junior"
    middle = "middle"
    senior = "senior"

class EmploymentType(str,Enum):
    full_time = "full_time"
    part_time = "part_time"
    internship = "internship"

class WorkFormat(str,Enum):
    remote = "remote"
    office = "office"
    hybrid = "hybrid"

class ApplicationDecision(str, Enum):
    hire = "hire"
    reject = "reject"