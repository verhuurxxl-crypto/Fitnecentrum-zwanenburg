document.querySelector('#print-terms')?.addEventListener('click',()=>window.print());
const termsContents=document.querySelector('.terms-toc');
if(termsContents){
 const compact=matchMedia('(max-width:900px)');
 const syncTermsContents=()=>{termsContents.open=!compact.matches;};
 syncTermsContents();compact.addEventListener('change',syncTermsContents);
}
