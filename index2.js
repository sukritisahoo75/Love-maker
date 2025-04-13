function fun(){
    getName = document.querySelector('.nameInput').value;
    localStorage.setItem('loverName', getName);
    window.location.href = "index2.html";
}