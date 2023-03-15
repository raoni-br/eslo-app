package app.invitation

import data.app.user as user_policy

default allow = false

default can_access = false

# ATTENTION: can_access and filter MUST be updated together

can_access {
	user_policy.is_admin
}

can_access {
	user_policy.is_teacher
	is_inviter
}

can_access {
	user_policy.is_student
	is_invitee
}

is_inviter {
	input.user.id == input.resource.inviterId
}

is_invitee {
	input.user.id == input.resource.inviteeId
}

# read
allow {
	input.action == "read"
	input.resourceType == "Invitation"
	can_access
}

# list
allow {
	input.action == "list"
	input.resourceType == "Invitation"
	filter[_]
}

filter["admin_condition"] = admin_condition {
	input.action == "list"
	input.resourceType == "Invitation"

	user_policy.is_admin
	admin_condition := {}
}

filter["teacher_condition"] = teacher_condition {
	input.action == "list"
	input.resourceType == "Invitation"

	user_policy.is_teacher

	teacher_condition := {"inviterId": input.user.id}
}

filter["student_condition"] = student_condition {
	input.action == "list"
	input.resourceType == "Invitation"

	user_policy.is_student

	student_condition := {"inviteeId": input.user.id}
}

# createInvitation
allow {
	input.action == "create"
	input.resourceType == "Invitation"
	user_policy.is_teacher
}

# cancelInvitation
allow {
	input.action == "cancel"
	input.resourceType == "Invitation"
	is_inviter
	input.resource.status == "PENDING"
}

allow {
	input.action == "cancel"
	input.resourceType == "Invitation"
	is_invitee
	input.resource.status == "PENDING"
}
