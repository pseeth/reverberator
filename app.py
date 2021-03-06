import web
import os

urls = (
	'/', 'home',
	'/upload', 'upload',
	'/eq', 'eq'
)

app = web.application(urls, globals())
render = web.template.render('templates/')

class home:
	def GET(self):
		return render.reverberator()

class eq:
	def GET(self):
		return render.equalizer()

class upload:
	def POST(self):
		x = web.input(myfile={})
		web.debug(x.keys())
		filedir = '/Users/prem/Dropbox/research/audealize/word_eq/'
		#if x['userid'] not in os.listdir(filedir):
		#	os.mkdir(filedir + x['userid']) 
		#filedir += x['userid']
		filepath = x['filename'].replace('\\', '/')
		filename = filepath.split('/')[-1]
		fout = open(filedir + filename, 'w')
		fout.write(x['blob'])
		fout.close()

if __name__ == "__main__":
	app.run()
