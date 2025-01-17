function layout (props) {
	return `<!doctype html>
	<html>
		<head>
			<title>${props.title}</title>
			<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
			<link rel="icon" type="image/png" href="/static/images/favicon-32.png" sizes="32x32" />
			<link rel="icon" type="image/png" href="/static/images/favicon-16.png" sizes="16x16" />
			${props.style
				.map((style) => style.wrapper(`<style>\n${style.content}\n</style>`))
				.join('\n')}
		</head>
		<body>
			${props.markup
				.filter((markup) => markup.environment === 'index')
				.map((markup) => markup.content)
				.join('\n')}
			${props.script
				.map((script) => script.wrapper(`<script>\n${script.content}\n</script>`))
				.join('\n')}
			<script src="/script/content.js"></script>
		</body>
	</html>
	`;
}

export default layout;
