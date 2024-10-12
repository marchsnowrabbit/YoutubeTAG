document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        const img = card.querySelector('.card__background');
        
        if (img) {
            // 이미지 로드 실패 시
            img.onerror = function() {
                card.classList.add('no-image');
            };
            
            // 이미지 src가 비어있거나 유효하지 않은 경우
            if (!img.src || img.src === '' || img.src === '#' || img.src === 'null') {
                card.classList.add('no-image');
            } else {
                // 이미지 로드 성공 시
                img.onload = function() {
                    card.classList.remove('no-image');
                };
            }
        }
    });
});