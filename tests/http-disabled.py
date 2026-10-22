import json,time,urllib.request,urllib.error
base='http://127.0.0.1:8085'
for attempt in range(30):
 try:
  data=json.load(urllib.request.urlopen(base+'/api/trial.php',timeout=2));break
 except OSError:time.sleep(.1)
else:raise RuntimeError('PHP-server niet beschikbaar')
assert data=={'available':False},data
def post(origin,content_type='application/json'):
 request=urllib.request.Request(base+'/api/trial.php',data=b'{}',headers={'Content-Type':content_type,'Origin':origin})
 try:
  with urllib.request.urlopen(request) as response:return response.status,json.load(response)
 except urllib.error.HTTPError as e:return e.code,json.load(e)
status,data=post(base);assert status==503 and 'error' in data,(status,data)
status,data=post('https://example.com');assert status==403,(status,data)
status,data=post(base,'text/plain');assert status==415,(status,data)
assert not any(__import__('pathlib').Path('.').rglob('trial.sqlite'))
print('Mailroute uit, cross-origin en verkeerde inhoud geweigerd; geen aanvraag of mail aangemaakt.')
