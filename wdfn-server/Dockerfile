FROM assets

RUN npm run build

FROM usgswma/python:3.8

COPY . $HOME/application
WORKDIR $HOME/application

RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir -r requirements-cloud-prod.txt

COPY --from=assets /assets/dist $HOME/assets

USER $USER

EXPOSE 5050

ENTRYPOINT ["gunicorn"]
CMD ["--config", "gunicorn.conf.py", "waterdata:app"]




