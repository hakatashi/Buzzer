$(document).ready(function () {
	$('#form').submit(function (event) {
		event.preventDefault();

		var $button = $(this).find('button');

		$.ajax({
			type: 'POST',
			url: '/',
			data: $(this).serialize(),
			timeout: 10000,
			beforeSend: function () {
				$button.attr('disabled', true);
			},
			complete: function () {
				$button.attr('disabled', false);
			},
			success: function (result) {
				alert(result);
			}
		});
	});
});
