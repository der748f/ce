import sys
import json
from sklearn.preprocessing import StandardScaler
import numpy as np
from pymongo import MongoClient

def get_student_performance(student_id):
    # Connect to MongoDB
    client = MongoClient('mongodb://localhost:27017')
    db = client.schoolApp
    
    # Get student's exam results
    exam_results = list(db.examResults.find({'studentId': student_id}))
    
    # Calculate performance metrics
    performance = {
        'average_score': 0,
        'subject_scores': {},
        'weak_areas': [],
        'strong_areas': []
    }
    
    if exam_results:
        scores = []
        for result in exam_results:
            subject = result.get('subject', {}).get('name', 'Unknown')
            score = result.get('score', 0)
            scores.append(score)
            
            if subject not in performance['subject_scores']:
                performance['subject_scores'][subject] = []
            performance['subject_scores'][subject].append(score)
        
        performance['average_score'] = np.mean(scores)
        
        # Identify weak and strong areas
        for subject, scores in performance['subject_scores'].items():
            avg_score = np.mean(scores)
            if avg_score < 70:
                performance['weak_areas'].append(subject)
            elif avg_score > 85:
                performance['strong_areas'].append(subject)
    
    return performance

def recommend_lessons(student_id):
    performance = get_student_performance(student_id)
    
    recommendations = {
        'priority_subjects': performance['weak_areas'],
        'recommended_lessons': [],
        'next_steps': []
    }
    
    # Connect to MongoDB to get available lessons
    client = MongoClient('mongodb://localhost:27017')
    db = client.schoolApp
    
    # Get lessons for weak areas
    for subject in performance['weak_areas']:
        lessons = list(db.lessons.find({'subject': subject}).sort('difficulty', 1))
        for lesson in lessons:
            recommendations['recommended_lessons'].append({
                'subject': subject,
                'title': lesson['title'],
                'priority': 'high',
                'reason': f'This will help improve your performance in {subject}'
            })
    
    # Add some advanced lessons for strong areas
    for subject in performance['strong_areas']:
        advanced_lessons = list(db.lessons.find({
            'subject': subject,
            'difficulty': 'advanced'
        }))
        for lesson in advanced_lessons:
            recommendations['recommended_lessons'].append({
                'subject': subject,
                'title': lesson['title'],
                'priority': 'medium',
                'reason': f'Challenge yourself in {subject}'
            })
    
    return recommendations

if __name__ == "__main__":
    if len(sys.argv) > 1:
        student_id = sys.argv[1]
        recommendations = recommend_lessons(student_id)
        print(json.dumps(recommendations))
    else:
        print(json.dumps({'error': 'No student ID provided'}))
