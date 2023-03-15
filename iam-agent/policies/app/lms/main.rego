package app.lms

import data.app.user as user_policy

default allow = false

# ATTENTION: can_access and filter MUST be updated together

can_access_programs[program_list] {
	user_policy.is_teacher
	product_list := input.user.subscriptions[_].subscriptionItems[_].price.product.slug
	program_list := data.productFeatures[product_list].lms.programs[_]
}

can_access_programs[program_list] {
	user_policy.is_student

	level_list := {level | level := input.user.studentEnrollments[_].levelId }
   	level := level_list[_]
   	program := data.programs[_]
   	program.modules[_].levels[_].id == level
    
    program_list := program.id
}

# Program

# read
allow {
	user_policy.is_admin
	input.action == "read"
	input.resourceType == "Program"
}

# read
allow {
	not user_policy.is_admin
	input.action == "read"
	input.resourceType == "Program"
	can_access_programs[_] == input.resource.id
}

# list
allow {
	input.action == "list"
	input.resourceType == "Program"
	filter[_]
}

filter["program_admin_condition"] = program_admin_condition {
	input.action == "list"
	input.resourceType == "Program"

	user_policy.is_admin

	program_admin_condition := {}
}

filter["program_user_condition"] = program_user_condition {
	input.action == "list"
	input.resourceType == "Program"

	not user_policy.is_admin

	program_user_condition := {"id": {"in": can_access_programs[_]}}
}

# Module

# read
allow {
	user_policy.is_admin
	input.action == "read"
	input.resourceType == "Module"
}

# read
allow {
	not user_policy.is_admin
	input.action == "read"
	input.resourceType == "Module"
	can_access_programs[_] == input.resource.programId
}

# list
allow {
	input.action == "list"
	input.resourceType == "Module"
	filter[_]
}

filter["module_admin_condition"] = module_admin_condition {
	input.action == "list"
	input.resourceType == "Module"

	user_policy.is_admin

	module_admin_condition := {}
}

filter["module_user_condition"] = module_user_condition {
	input.action == "list"
	input.resourceType == "Module"

	not user_policy.is_admin

	module_user_condition := {"programId": {"in": can_access_programs[_]}}
}

# Level

can_access_level[level_list] {
	user_policy.is_teacher
	data.programs[_].id == can_access_programs[_]
	level_list := data.programs[_].modules[_].levels[_].id
}

can_access_level[level_list] {
	user_policy.is_student
	level_list := input.user.studentEnrollments[_].levelId
}

# read
allow {
	user_policy.is_admin
	input.action == "read"
	input.resourceType == "Level"
}

# read
allow {
	not user_policy.is_admin
	input.action == "read"
	input.resourceType == "Level"
	can_access_level[_] == input.resource.id
}

# list
allow {
	input.action == "list"
	input.resourceType == "Level"
	filter[_]
}

filter["level_admin_condition"] = level_admin_condition {
	input.action == "list"
	input.resourceType == "Level"

	user_policy.is_admin

	level_admin_condition := {}
}

filter["level_user_condition"] = level_user_condition {
	input.action == "list"
	input.resourceType == "Level"

	not user_policy.is_admin

    level_list := [level |
    	level := can_access_level[_]
    ]
    level_user_condition := {"id": {"in": level_list}}
}

# Lesson

# read
allow {
	user_policy.is_admin
	input.action == "read"
	input.resourceType == "Lesson"
}

# read
allow {
	not user_policy.is_admin
	input.action == "read"
	input.resourceType == "Lesson"
	can_access_level[_] == input.resource.levelId
}

# list
allow {
	input.action == "list"
	input.resourceType == "Lesson"
	filter[_]
}

filter["lesson_admin_condition"] = lesson_admin_condition {
	input.action == "list"
	input.resourceType == "Lesson"

	user_policy.is_admin

	lesson_admin_condition := {}
}

filter["lesson_user_condition"] = lesson_user_condition {
	input.action == "list"
	input.resourceType == "Lesson"

	not user_policy.is_admin

    level_list := [level |
    	level := can_access_level[_]
    ]
    lesson_user_condition := {"levelId": {"in": level_list}}
}
