package app.class_record

import data.app.enrollment as enrollment_policy
import data.app.user as user_policy

default allow = false

default can_access = false

# ATTENTION: can_access and filter MUST be updated together

# ClassRecord

can_access {
	user_policy.is_admin
}

can_access {
	user_policy.is_teacher
}

can_access {
	user_policy.is_student
	# input.user.id == input.resource.studentId
}

# read
allow {
	input.action == "read"
	input.resourceType == "ClassRecord"
	can_access
}

# list
allow {
	input.action == "list"
	input.resourceType == "ClassRecord"
	filter[_]
}

filter["admin_condition"] = admin_condition {
	input.resourceType == "ClassRecord"
	user_policy.is_admin
	admin_condition := {}
}

filter["teacher_condition"] = teacher_condition {
	input.resourceType == "ClassRecord"
	user_policy.is_teacher

	teacher_condition := {"enrollment": {"teacherId": input.user.id}}
}

filter["teacher_group_condition"] = teacher_group_condition {
	input.resourceType == "ClassRecord"
	user_policy.is_teacher

	teacher_group_condition := {"enrollment": {"studyGroup": {"studyGroupTeachers": {"some": {"teacherId": input.user.id}}}}}
}

filter["student_condition"] = student_condition {
	input.resourceType == "ClassRecord"
	user_policy.is_student

	student_condition := {"enrollment": {"studentId": input.user.id}}
}

# createClassRecord
allow {
	input.action == "create"
	input.resourceType == "ClassRecord"
	user_policy.is_teacher
}

# activateClassRecord
allow {
	input.action == "activate"
	input.resourceType == "ClassRecord"
	user_policy.is_admin
	input.resource.status == "CONFIRMED"
}

# deleteClassRecord
allow {
	input.action == "delete"
	input.resourceType == "ClassRecord"
	can_access

	# TODO: only teachers should be able do delete records
	# input must have enrollment / study group info to validate
	# enrollment_policy.teacher_of
}

# StudyGroupClassRecord

# read
allow {
	input.action == "read"
	input.resourceType == "StudyGroupClassRecord"
	can_access
}

# list
allow {
	input.action == "list"
	input.resourceType == "StudyGroupClassRecord"
	filter[_]
}

filter["admin_condition"] = admin_condition {
	input.resourceType == "StudyGroupClassRecord"
	user_policy.is_admin
	admin_condition := {}
}

filter["teacher_group_condition"] = teacher_group_condition {
	input.resourceType == "StudyGroupClassRecord"
	user_policy.is_teacher

	teacher_group_condition := {"studyGroup": {"studyGroupTeachers": {"some": {"teacherId": input.user.id}}}}
}

filter["student_condition"] = student_condition {
	input.resourceType == "StudyGroupClassRecord"
	user_policy.is_student

	student_condition := {"studyGroupClassAttendees": {"some": {"student": {"studentId": input.user.id}}}}
}

# createStudyGroupClassRecord
allow {
	input.action == "create"
	input.resourceType == "StudyGroupClassRecord"
	user_policy.is_teacher
}

# activateStudyGroupClassRecord
allow {
	input.action == "activate"
	input.resourceType == "StudyGroupClassRecord"
	user_policy.is_admin
	input.resource.status == "CONFIRMED"
}

# deleteStudyGroupClassRecord
allow {
	input.action == "delete"
	input.resourceType == "StudyGroupClassRecord"
	can_access

	# TODO: only teachers should be able do delete records
	# input must have enrollment / study group info to validate
	# enrollment_policy.teacher_of
}
