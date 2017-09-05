import os
from random import randrange
from PIL import Image, ImageFont, ImageDraw


def listimages(directory):
	files = []
	extensions = ["jpg", "jpeg", "png", "bmp"]
	for file in os.listdir(directory):
		lfile = file.lower()
		for ext in extensions:
			if lfile.endswith("." + ext):
				files.append(file)
	return files

def generate(config, filename):
	img = Image.new(
		"RGBA", 
		tuple(config["canvas"]["dimensions"]), 
		color=tuple(config["canvas"]["background"])
	)
	for area in config["areas"]:
		if area["type"] == "image":
			if area["imagetype"] == "fixed":
				pass
			elif area["imagetype"] == "random":
				imglist = listimages(area["location"])
				randimg = Image.open(area["location"] + "/" + imglist[randrange(len(imglist))])
				
				box = area["position"]
				boxsize = [box[2] - box[0], box[3] - box[1]]
				size = randimg.size
				if size[0] < boxsize[0]:
					boxsize[0] = size[0]
				if size[1] < boxsize[1]:
					boxsize[1] = size[1]
				asp = size[0]/size[1]
				boxasp = boxsize[0]/boxsize[1]
				if asp < boxasp:
					boxsize[0] = (size[0]*boxsize[1])//size[1]
				else:
					boxsize[1] = (size[1]*boxsize[0])//size[0]
				pos = [(box[0] + box[2] - boxsize[0])//2, (box[1] + box[3] - boxsize[1])//2]

				randimg = randimg.resize(tuple(boxsize))
				if randimg.mode == "RGBA":
					img.paste(randimg, tuple(pos), randimg)
				else:
					img.paste(randimg, tuple(pos))
			else:
				print("Unknown image type: " + area["imagetype"])
		elif area["type"] == "text":
			if area["texttype"] == "fixed":
				font = ImageFont.truetype("fonts/" + area["font"], area["size"])
				draw = ImageDraw.Draw(img)
				box = area["position"]
				pos = [(box[0] + box[2])//2, (box[1] + box[3])//2]
				tw, th = draw.textsize(area["value"], font=font)
				pos[0] -= tw//2
				pos[1] -= th//2
				draw.text(tuple(pos), area["value"], tuple(area["color"]), font=font)
			else:
				print("Unknown text type: " + area["textype"])
		else:
			print("Unknown area type: " + area["type"])
	img.save(filename, "JPEG")

config = {
	"canvas": {
		"dimensions": [600, 600],
		"background": [255,255,255],
	},
	"areas": [
		{
			"position": [20, 80, 280, 300],
			"type": "image",
			"imagetype": "random",
			"location": "./srcimgs"
		},
		{
			"position": [320, 80, 580, 300],
			"type": "image",
			"imagetype": "random",
			"location": "./srcimgs"
		},
		{
			"position": [20, 300, 280, 520],
			"type": "image",
			"imagetype": "random",
			"location": "./srcimgs"
		},
		{
			"position": [320, 300, 580, 520],
			"type": "image",
			"imagetype": "random",
			"location": "./srcimgs"
		},
		{
			"position": [100, 0, 500, 80],
			"type": "text",
			"font": "arialnb.ttf",
			"color": [0,0,0],
			"size": 64,
			"texttype": "fixed",
			"value": "Top text",
		},
		{
			"position": [100, 520, 500, 600],
			"type": "text",
			"font": "arialnb.ttf",
			"color": [0,0,0],
			"size": 64,
			"texttype": "fixed",
			"value": "Bottom text",
		}
	]
}

for i in range(20):
	generate(config, "dstimgs/out%02d.jpeg" % i)