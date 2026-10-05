# Membuat ikon PWA (192 & 512 px) sebagai PNG, mengikuti konsep favicon.svg:
# kotak oranye membulat + printer thermal putih + garis + titik status hijau.
Add-Type -AssemblyName System.Drawing

function New-RoundedPath([single]$x, [single]$y, [single]$w, [single]$h, [single]$r) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $p.AddArc($x, $y, $d, $d, 180, 90)
  $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $p.CloseFigure()
  return $p
}

function Draw-Icon([int]$size, [string]$out) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $s = $size / 32.0  # koordinat berbasis viewBox 32

  $orange = [System.Drawing.Color]::FromArgb(255, 225, 85, 47)
  $white  = [System.Drawing.Color]::FromArgb(255, 251, 250, 247)
  $dark   = [System.Drawing.Color]::FromArgb(255, 27, 31, 35)
  $grey   = [System.Drawing.Color]::FromArgb(255, 154, 163, 172)
  $teal   = [System.Drawing.Color]::FromArgb(255, 31, 111, 92)

  # background rounded
  $b = New-RoundedPath (2*$s) (2*$s) (28*$s) (28*$s) (7*$s)
  $br = New-Object System.Drawing.SolidBrush $orange
  $g.FillPath($br, $b)

  # kertas (atas)
  $pa = New-RoundedPath (8*$s) (7*$s) (16*$s) (7*$s) (1.5*$s)
  $pw = New-Object System.Drawing.SolidBrush $white
  $g.FillPath($pw, $pa)

  # badan printer
  $bo = New-RoundedPath (6*$s) (13*$s) (20*$s) (9*$s) (2*$s)
  $g.FillPath($pw, $bo)

  # garis gelap + abu
  $l1 = New-RoundedPath (10*$s) (16*$s) (12*$s) (1.6*$s) (0.8*$s)
  $lb = New-Object System.Drawing.SolidBrush $dark
  $g.FillPath($lb, $l1)
  $l2 = New-RoundedPath (10*$s) (19*$s) (8*$s) (1.6*$s) (0.8*$s)
  $lgb = New-Object System.Drawing.SolidBrush $grey
  $g.FillPath($lgb, $l2)

  # titik status teal
  $dia = 2.4*$s
  $g.FillEllipse((New-Object System.Drawing.SolidBrush $teal), (22*$s - $dia/2), (15.5*$s - $dia/2), $dia, $dia)

  $g.Dispose()
  $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host "written: $out"
}

$dir = Join-Path $PSScriptRoot "..\public\icons"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
Draw-Icon 192 (Join-Path $dir "icon-192.png")
Draw-Icon 512 (Join-Path $dir "icon-512.png")
Draw-Icon 180 (Join-Path $dir "apple-touch-icon.png")
