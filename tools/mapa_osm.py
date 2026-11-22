# uso: mapa_osm.py prefijo z x0 y0 nx ny lat0 lon0 paso_lote
import sys, glob, os, math, numpy as np
from PIL import Image
from scipy import ndimage as nd
from scipy.stats import mode
pre=sys.argv[1]; z,x0,y0,nx,ny=map(int,sys.argv[2:7]); LAT0,LON0=float(sys.argv[7]),float(sys.argv[8]); paso=float(sys.argv[9])
D=glob.glob('/tmp/claude-tool-results/*/')[0]
fs=sorted([f for f in os.listdir(D) if f.endswith('.png')], key=lambda f: os.path.getmtime(D+f))[-nx*ny:]
W,H=nx*256,ny*256; big=Image.new('RGB',(W,H))
for f,(i,j) in zip(fs,[(i,j) for j in range(ny) for i in range(nx)]):
    a=np.array(Image.open(D+f).convert('RGB')).astype(int); m=a.sum(2)>60; ys,xs=np.where(m); xa,ya=xs.min(),ys.min()
    assert xs.max()-xa==255, f
    big.paste(Image.open(D+f).convert('RGB').crop((xa,ya,xa+256,ya+256)),(i*256,j*256))
big.save('stitch.png'); a=np.array(big).astype(float)
C={'land':[(242,239,233),(224,223,223),(238,240,213),(245,233,198),(235,219,232)],'bldg':[(217,208,201),(196,182,171),(208,198,190)],
 'road':[(255,255,255),(247,250,191),(252,214,164),(249,178,156),(232,146,162),(221,221,232)],'park':[(200,250,204),(205,235,176),(173,209,158),(181,227,181),(222,246,192),(170,224,203)],
 'water':[(170,211,223)],'rail':[(187,187,187),(170,170,170)],'text':[(0,0,0),(60,60,60),(100,100,100),(80,90,200),(51,51,51),(90,90,160),(30,30,30),(160,100,140)]}
names=list(C); cols=[];lab=[]
for i,k in enumerate(names):
    for c in C[k]: cols.append(c); lab.append(i)
cols=np.array(cols,float); lab=np.array(lab)
cls=lab[((a[:,:,None,:]-cols[None,None])**2).sum(-1).argmin(-1)]
m=cls==names.index('text'); idx=nd.distance_transform_edt(m,return_distances=False,return_indices=True); cls=cls[idx[0],idx[1]]
pad=np.pad(cls,1,mode='edge'); cls=mode(np.stack([pad[i:i+H,j:j+W] for i in range(3) for j in range(3)]),axis=0,keepdims=False).mode
Wt=names.index('water'); water=nd.binary_opening(cls==Wt,iterations=1); l2,n=nd.label(water); sz=nd.sum(water,l2,range(1,n+1)); water=np.isin(l2,np.where(sz>=25)[0]+1)
cls[(cls==Wt)&~water]=0
pal={'land':(236,231,221),'bldg':(220,207,190),'road':(252,251,248),'park':(185,220,158),'water':(120,170,195),'rail':(200,196,190),'text':(236,231,221)}
out=np.zeros((H,W,3),np.uint8)
for i,k in enumerate(names): out[cls==i]=pal[k]
Image.fromarray(out).save(f'/home/claude/sinea/img/{pre}-suelo.png',optimize=True)
N=2**z
def px(lat,lon): return ((lon+180)/360*N-x0)*256, ((1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*N-y0)*256
ox,oy=px(LAT0,LON0); M=156543.03392*math.cos(math.radians(LAT0))/N
sd=(nd.distance_transform_edt(~water)-nd.distance_transform_edt(water))*M
Image.fromarray(np.clip(np.round(128+sd/2),0,255).astype(np.uint8)).save(f'/home/claude/sinea/img/{pre}-tierra.png',optimize=True)
B=(cls==names.index('bldg')).astype(float); fr=nd.uniform_filter(B,size=3); rng=np.random.default_rng(4); lot=[]
st=paso/M; y=st/2
while y<H:
    x=st/2
    while x<W:
        if fr[int(y),int(x)]>0.7:
            X=(x-ox)*M; Y=(oy-y)*M; bh=(math.sin(math.floor(X/45)*12.9898+math.floor(Y/45)*78.233)*43758.5453)%1
            lot+=[round(X),round(Y),round(13+bh*12+rng.random()*3)]
        x+=st
    y+=st
P=(cls==names.index('park')).astype(float); fp=nd.uniform_filter(P,size=5); arb=[]; st=16/M; y=st/2
while y<H:
    x=st/2
    while x<W:
        if fp[int(y),int(x)]>0.8 and rng.random()<.6: arb+=[round((x-ox+(rng.random()-.5)*st)*M),round((oy-y+(rng.random()-.5)*st)*M)]
        x+=st
    y+=st
open(f'/home/claude/sinea/js/ciudades/{pre}-lotes.js','w').write(f'// Edificios [x, y, alto] y árboles [x, y] a partir del mapa de OpenStreetMap\nexport const LOTES = ['+','.join(map(str,lot))+'];\nexport const ARBOLES = ['+','.join(map(str,arb))+'];\n')
print('origin',ox,oy,'M',M,'W,H',W,H,'lotes',len(lot)//3,'arb',len(arb)//2,'agua',water.mean())
