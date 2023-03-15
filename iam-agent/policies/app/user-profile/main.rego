package app.user

roles["admin"] {
	user_domain := split(input.user.primaryEmail, "@")[1]
	data.esloDomains[_] == user_domain
}

roles["teacher"] {
	input.user.subscriptions[_].subscriptionItems[_].price.product.subcategoryCode == data.teacherSubcategoryCodes[_]
}

roles["student"] {
	# there is no subscription for students anymore
	# any authenticated user with a student enrollment is considered a student
	count(input.user.studentEnrollments) > 0
}

is_admin {
	roles[_] == "admin"
}

is_teacher {
	roles[_] == "teacher"
}

is_student {
	roles[_] == "student"
}
