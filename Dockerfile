FROM python:3.6

RUN mkdir /app

COPY ./ /app

RUN pip3 install -r /app/requirements.txt

WORKDIR /app

CMD ["uwsgi", "--ini", "symphony-gif-app.ini"]
