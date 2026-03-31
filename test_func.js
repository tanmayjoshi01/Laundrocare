const url = 'https://xskkyxphzluggvqaotta.supabase.co/functions/v1/send-daily-report';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhza2t5eHBoemx1Z2d2cWFvdHRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MTE3OTQsImV4cCI6MjA5MDI4Nzc5NH0.6tOt7drw_IyODwlKhdr69OjTyaXi_No3pBo0lPmE5g0';

fetch(url, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + key,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({})
})
.then(r => r.json())
.then(data => console.log('RESPONSE:', data))
.catch(err => console.error('ERROR:', err));
