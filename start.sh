cd frontend &&
npm install &&
npm run dev &

cd backend && 
pip3 -m venv venv && 
source venv/bin/activate && 
pip3 install -r requirements.txt && 
python3 manage.py runserver 0.0.0.0:8000 &

wait
