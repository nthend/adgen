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
			if area["imagetype"] == "random":
				location = "input"
				imglist = listimages(location)
				randimg = Image.open(location + "/" + imglist[randrange(len(imglist))])
				
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
			value = None
			if area["texttype"] == "fixed":
				value = area["value"]
			elif area["texttype"] == "range":
				number = area["min"] + randrange((area["max"] - area["min"])/area["step"])*area["step"]
				value = area["prefix"] + str(number) + area["postfix"]
			else:
				print("Unknown text type: " + area["textype"])

			if value is not None:
				font = ImageFont.truetype("fonts/" + area["font"] + ".ttf", area["size"])
				draw = ImageDraw.Draw(img)
				box = area["position"]
				pos = [(box[0] + box[2])//2, (box[1] + box[3])//2]
				tw, th = draw.textsize(value, font=font)
				pos[0] -= tw//2
				pos[1] -= th//2
				draw.text(tuple(pos), value, tuple(area["color"]), font=font)
		else:
			print("Unknown area type: " + area["type"])
	img.save(filename, "JPEG")

def generate_multiple(config, count, fnfmt):
	for i in range(count):
		generate(config, fnfmt % (i+1))
