package app.enrollment

import data.app.user as user_policy

default allow = false

default can_access = false

# ATTENTION: can_access and filter MUST be updated together

can_access {
	user_policy.is_admin
}

can_access {
	user_policy.is_teacher
	teacher_of(input.resource)
}

can_access {
	user_policy.is_student
	input.user.id == input.resource.studentId
}

teacher_of(enrollment) {
	input.user.id == enrollment.teacherId
}

teacher_of(enrollment) {
	input.user.id == enrollment.studyGroup.studyGroupTeachers[_].teacherId
}

# read
allow {
	input.action == "read"
	input.resourceType == "Enrollment"
	can_access
}

# list
allow {
	input.action == "list"
	input.resourceType == "Enrollment"
	filter[_]
}

filter["admin_condition"] = admin_condition {
	input.action == "list"
	input.resourceType == "Enrollment"

	user_policy.is_admin
	admin_condition := {}
}

filter["teacher_condition"] = teacher_condition {
	input.action == "list"
	input.resourceType == "Enrollment"

	user_policy.is_teacher

	teacher_condition := {"teacherId": input.user.id}
}

filter["teacher_group_condition"] = teacher_group_condition {
	input.action == "list"
	input.resourceType == "Enrollment"

	user_policy.is_teacher

	teacher_group_condition := {"studyGroup": {"studyGroupTeachers": {"some": {"teacherId": input.user.id}}}}
}

filter["student_condition"] = student_condition {
	input.action == "list"
	input.resourceType == "Enrollment"

	user_policy.is_student

	student_condition := {"studentId": input.user.id}
}

# createEnrollment
allow {
	input.action == "create"
	input.resourceType == "Enrollment"
	user_policy.is_teacher
}

# activateEnrollment
allow {
	input.action == "activate"
	input.resourceType == "Enrollment"
	user_policy.is_admin
}

allow {
	input.action == "activate"
	input.resourceType == "Enrollment"
	user_policy.is_student
	input.resource.studentId == input.user.id
}

# cancelEnrollment
allow {
	input.action == "cancel"
	input.resourceType == "Enrollment"
	can_access
	teacher_of(input.resource)
}

allow {
	input.action == "cancel"
	input.resourceType == "Enrollment"

	user_policy.is_student
	input.user.id == input.resource.studentId
	input.resource.status == "PENDING"
}

# updateEnrollment
allow {
	input.action == "update"
	input.resourceType == "Enrollment"
	user_policy.is_teacher
	teacher_of(input.resource)
}
