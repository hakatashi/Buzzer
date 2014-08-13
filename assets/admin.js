$(document).ready(function () {
	$('button').click(function () {
		var quizNumber = $(this).text();
		$.post('/admin', {
			quizNumber: quizNumber
		});
	});
});
