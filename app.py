from flask import Flask, render_template, request
from ScrapPage import scrap
from ResponseGen import GetResponse
app = Flask(__name__)

global d
first = ". Write a straightforward response in plain text as a single paragraph of 150-200 words, explaining why I need financial aid to complete this course. Use neutral language, avoid conversational phrases, do not address me by name, and do not use bold, italics, or any formatting. Write on behalf of me."
second = ". Write a straightforward response in plain text as a single paragraph of 150-200 words, explaining how this course will help achieve my career and educational goals. Use neutral language, avoid conversational phrases, do not address me by name, and do not use bold, italics, or any formatting. Write like you are giving the answer"

def personalisedDetails(data):
    def get_value(key, default=['']):
        value = data.get(key, default)
        return value[0] if isinstance(value, list) else value

    res = f"I'm applying for Financial aid on Coursera platform for a course named {get_value('courseType')}."
    specialization = get_value('specialization')
    if specialization:
        spec_name = specialization.split('/')[-1] if '/' in specialization else specialization
        res += f" This course comes under a specialization named {spec_name}."
    courses = data.get('courses')
    if courses:
        if len(courses) > 1:
            res += f" Under this specialization, previously I've covered {len(courses)} courses, namely {', '.join(courses[:-1])}, and {courses[-1]}."
        else:
            res += f" Under this specialization, previously I've covered 1 course, namely {courses[0]}."
    res += f" My name is {get_value('name')}."
    institute = get_value('institute')
    if institute:
        res += f" I'm currently studying at {institute}"
        year = get_value('year')
        if year:
            res += f", in my {year} year"
    else:
        organization = get_value('organization')
        if organization:
            res += f" I'm currently working at {organization}"
            position = get_value('position')
            if position:
                res += f", as a {position}"
    return res

@app.get("/")
def home():
    return render_template("index.html")

@app.get("/Result")
def getres():
    return render_template("Result.html")

@app.post("/submit")
def submit():
    data = request.get_json()
    obj = data.get('obj')
    scrapped = scrap(obj['title'], obj['URL'])
    if scrapped:
        url, courselist = scrapped
        courselist = list(enumerate(courselist))
    else:
        url, courselist = None, []
    return render_template("Result.html", obj = obj, url = url, courselist = courselist)

@app.post("/GetPrompt")
def getprompt():
    global d
    data = request.form.to_dict(flat=False)
    d = personalisedDetails(data)
    p1 = personalisedDetails(data)+first
    p2 = personalisedDetails(data)+second
    try:
        return render_template("ShowResponse.html", firstRes = GetResponse(p1), secondRes = GetResponse(p2))
    except:
        return render_template("NotFound.html", statusCode = 500, title = "Internal Server Error", desc = "Something went wrong while communicating with an external API. Please try again later or contact support if the issue persists.", btn="Try Again")

@app.post("/regenerate")
def regen():
    global d
    data = request.get_json()
    if data['boxNumber'] == 1:
        newRes = GetResponse(d+first)
    else:
        newRes = GetResponse(d+second)

    return {"response": newRes}

@app.get("/error")
def getErrorPage():
    return render_template("NotFound.html")

@app.errorhandler(404)
def page_not_found(e):
    return render_template("NotFound.html", statusCode = 404, title = "UH OH! You're lost.", desc="The page you are looking for does not exist. How you got here is a mystery. But you can click the button below to go back to the homepage.", btn="HOME"), 404
   
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)