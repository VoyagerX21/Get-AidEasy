from bs4 import BeautifulSoup
import os
import requests

def scrap(currName, url):
    print("Scraping:", url)
    os.makedirs('./static/scraps/', exist_ok=True)

    name = url.rstrip('/').split("/")[-1] or 'index'
    file_path = f'./static/scraps/{name}.html'

    if not os.path.exists(file_path):
        print("New file written in cache")
        res = requests.get(url)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(res.text)
        soup = BeautifulSoup(res.text, 'lxml')

    with open(file_path, 'r', encoding='utf-8') as f:
        res = f.read()
        soup = BeautifulSoup(res, 'lxml')

    indicator = soup.find('p', class_="css-4s48ix")

    if indicator and "this course is part of" in indicator.text.lower():
        a_tag = indicator.find('a')
        href = a_tag.get('href') if a_tag else None
        spec_url = None
        courselist = []
        if href:
            spec_url = 'https://www.coursera.org' + href
            spec_name = href.strip('/').split('/')[-1]
            spec_path = f'./static/scraps/{spec_name}.html'

            if not os.path.exists(spec_path):
                print(f"Downloading specialization page: {spec_url}")
                spec_res = requests.get(spec_url)
                with open(spec_path, 'w', encoding='utf-8') as f:
                    f.write(spec_res.text)
                specSoup = BeautifulSoup(spec_res.text, 'lxml')
            else:
                print("Specialization page found in cache")
                with open(spec_path, 'r', encoding='utf-8') as f:
                    spec_res = f.read()
                    specSoup = BeautifulSoup(spec_res, 'lxml')

            allCoursesUnder = specSoup.find_all('div', class_="css-zwlk01")

            print(f"Found {len(allCoursesUnder)} course(s) in specialization.")
            for each in allCoursesUnder:
                # print(each.text)
                otherCourseName = ' '.join(each.text.split()[:-2])[:-6]
                if otherCourseName.lower() != currName.lower():
                    courselist.append(otherCourseName)
        else:
            print("No 'href' found in specialization link.")
        return spec_url, courselist
    else:
        print("This course is not part of a specialization.")
        return