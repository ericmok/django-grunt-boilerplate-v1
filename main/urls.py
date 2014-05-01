from django.conf.urls import patterns, include, url

urlpatterns = patterns('',

    url('^$', 'main.views.home.index', name='home'),

)