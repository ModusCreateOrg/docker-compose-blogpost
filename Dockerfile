FROM node:8.6.0
RUN useradd --create-home --shell /bin/false app
ADD . /home/app
ENV HOME=/home/app
ENV NODE_ENV=development
RUN cd $HOME && chown -R app:app $HOME
USER app
WORKDIR $HOME
RUN npm install && npm cache clear --force

