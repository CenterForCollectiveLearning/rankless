import { linkVertical } from "d3-shape";

export const rectangleLinkPath = linkVertical()
    .source((d) => d.start)
    .target((d) => d.end);

// -600 -300 1600 1700
export const thinFlowerPaths = [
    'M-472.039 366.638C-631.404 30.109 -276.239 -69.047 3.26891 -7.86865C165.058 20.4416 235.166 -167.781 435.614 -132.582C636.062 -97.3838 447.556 156.776 755.296 216.532C1063.04 276.288 1008.34 793.827 757.191 843.569C506.04 893.311 589.812 964.116 370.816 1197.85C151.82 1431.59 -319.009 1242.32 -262.009 945.599C-205.01 648.874 -299.524 730.937 -472.039 366.638Z',
    'M118.716 546.98C101.572 515.271 144.81 451.727 191.265 467.503C233.804 481.949 270.841 460.72 298.618 465.62C371.744 478.521 348.753 496.132 384.667 520.355C428.371 549.831 462.702 641.016 376.698 656.045C305.964 668.406 333.132 699.062 282.827 723.541C232.521 748.019 167.925 732.605 156.004 664.386C151.527 638.768 147.269 599.793 118.716 546.98Z',
    'M-418.642 381.316C-565.078 72.4979 -238.27 -23.4207 20.0513 33.6302C171 60.6801 238.101 -112.361 422.852 -79.9171C611.725 -46.7455 438.266 185.91 721.295 242.436C1005.03 299.439 958.429 778.218 722.292 824.805C487.544 871.148 566.17 938.303 362.509 1153.02C158.848 1367.73 -275.05 1194.27 -224.316 918.317C-172.906 646.239 -259.214 717.298 -418.642 381.316Z',
    'M-365.241 395.997C-498.747 114.889 -200.296 22.2078 36.8381 75.1312C176.946 100.921 241.041 -56.9394 410.094 -27.2496C587.393 3.89491 428.98 215.046 687.298 268.341C947.031 322.592 908.522 762.612 687.398 806.042C469.051 848.988 542.531 912.493 354.206 1108.18C165.881 1303.87 -231.087 1146.22 -186.619 891.038C-140.797 643.605 -218.901 703.661 -365.241 395.997Z',
    'M-311.843 410.676C-432.42 157.28 -162.326 67.8361 53.6213 116.632C182.888 141.161 243.977 -1.51779 397.333 25.4177C563.056 54.5351 419.691 244.182 653.297 294.247C889.027 345.745 858.611 747.005 652.501 787.28C450.555 826.827 518.889 886.682 345.9 1063.35C172.91 1240.02 -187.128 1098.16 -148.925 863.758C-108.692 640.972 -178.59 690.024 -311.843 410.676Z',
    'M-258.437 425.353C-366.085 199.667 -124.348 113.461 70.4132 158.129C188.839 181.398 246.921 53.9004 384.58 78.0815C538.729 105.172 410.41 273.314 619.305 320.149C831.031 368.894 808.709 731.395 617.612 768.514C432.068 804.663 495.256 860.868 337.602 1018.51C179.948 1176.15 -143.16 1050.11 -111.222 836.475C-76.5783 638.335 -138.272 676.384 -258.437 425.353Z',
    'M-204.831 441.222C-299.55 243.247 -86.1701 160.278 87.4041 200.819C194.989 222.827 250.065 110.511 372.026 131.938C514.6 157.001 401.328 303.639 585.511 347.243C773.235 393.236 759.006 716.977 582.922 750.94C413.779 783.691 471.822 836.246 329.503 974.866C187.185 1113.49 -98.9925 1003.24 -73.3209 810.384C-44.2654 636.89 -97.7538 663.936 -204.831 441.222Z',
    'M-150.978 458.474C-232.767 288.21 -47.7439 208.479 104.644 244.892C201.387 265.64 253.457 168.505 359.721 187.178C490.72 210.214 392.495 335.347 551.967 375.721C715.687 418.961 709.551 703.943 548.481 734.751C395.74 764.103 448.637 813.008 321.653 932.605C194.67 1052.2 -54.5767 957.762 -35.1707 785.677C-11.7039 636.829 -56.9872 652.871 -150.978 458.474Z',
    'M-97.1243 475.814C-165.985 333.261 -9.31841 256.767 121.882 289.053C207.785 308.541 256.848 226.587 347.415 242.505C466.84 263.514 383.661 367.142 518.421 404.287C658.138 444.774 660.096 690.996 514.039 718.648C377.699 744.602 425.45 789.858 313.803 890.43C202.155 991.003 -10.1617 912.369 2.97883 761.058C20.8569 636.855 -16.2215 641.894 -97.1243 475.814Z',
    'M-43.2339 493.262C-99.165 378.42 29.1442 305.164 139.158 333.322C214.22 351.55 260.277 284.777 335.146 297.941C442.996 316.923 374.865 399.047 484.913 432.961C600.627 470.695 610.678 678.158 479.634 702.654C359.696 725.21 402.301 766.816 305.989 848.365C209.677 929.914 34.2904 867.085 41.1655 736.547C53.4548 636.991 24.5814 631.026 -43.2339 493.262Z',
    'M10.6849 510.874C-32.317 423.743 67.6353 353.724 156.463 377.755C220.684 394.722 263.734 343.13 322.906 353.539C419.181 370.494 366.096 431.114 451.434 461.798C543.144 496.779 561.288 665.482 445.258 686.823C341.721 705.981 379.181 743.937 298.204 806.462C217.227 868.988 78.771 821.964 79.3805 712.199C86.0811 637.289 65.4128 620.32 10.6849 510.874Z',
    'M64.6547 528.734C34.582 469.314 106.177 402.533 173.818 422.436C227.198 438.143 267.242 401.732 310.716 409.387C395.417 424.315 357.379 463.43 418.005 490.884C485.712 523.112 511.949 653.056 410.933 671.241C323.797 687.001 356.111 721.307 290.47 764.808C224.828 808.31 123.303 777.091 117.647 688.099C118.758 637.835 106.295 609.864 64.6547 528.734Z'
];
// 0 0 800 800
export const flowerPaths = [
    'M609.732 103.995C777.17 102.746 750.334 266.38 672.437 368.786C630.245 429.408 693.73 493.655 641.405 568.739C589.08 643.823 521.13 518.798 438.466 632.989C355.801 747.179 155.088 626.838 182.374 514.986C209.661 403.134 164.916 423.887 111.07 290.296C57.2249 156.704 223.603 0.532255 333.823 79.9854C444.042 159.439 428.477 105.347 609.732 103.995Z',
    'M424.28 310.773C440.46 309.788 458.185 339.459 442.952 355.417C429.002 370.03 430.644 389.156 423.384 399.557C404.271 426.937 401.443 414.224 384.761 424.283C364.461 436.524 320.769 433.253 330.931 395.33C339.288 364.141 321.639 369.414 321.185 344.26C320.73 319.107 339.253 295.682 369.334 303.742C380.63 306.768 397.332 312.415 424.28 310.773Z',
    'M593.632 122.992C747.32 121.767 724.534 273.223 652.334 367.77C612.709 424.21 670.572 484.355 622.344 553.558C573.038 624.305 511.009 509.491 434.343 614.215C357.348 719.137 170.909 609.439 196.639 504.307C222.205 399.788 179.923 419.135 130.931 295.401C81.9394 171.668 234.876 27.5634 337.81 100.526C439.037 173.032 426.405 124.371 593.632 122.992Z',
    'M577.531 141.992C717.468 140.79 698.734 280.067 632.231 366.756C595.173 419.013 647.414 475.056 603.283 538.379C556.996 604.789 500.887 500.185 430.219 595.443C358.894 691.097 186.73 592.041 210.903 493.631C234.748 396.444 194.929 414.384 150.791 300.508C106.653 186.633 246.148 54.5962 341.797 121.069C434.031 186.626 424.332 143.396 577.531 141.992Z',
    'M561.426 160.989C687.613 159.812 672.929 286.911 612.123 365.74C577.633 413.814 624.252 465.756 584.217 523.198C540.95 585.272 490.761 490.878 426.091 576.669C360.436 663.055 202.546 574.642 225.162 482.953C247.286 393.099 209.931 409.631 170.647 305.613C131.363 201.596 257.416 81.6276 345.78 141.61C429.021 200.22 422.255 162.42 561.426 160.989Z',
    'M545.325 179.988C657.76 178.835 647.128 293.755 592.018 364.726C560.095 408.617 601.092 456.457 565.154 508.02C524.906 565.757 480.637 481.573 421.967 557.897C361.98 635.015 218.365 557.245 239.425 472.276C259.828 389.756 224.936 404.88 190.505 310.721C156.075 216.561 268.687 108.661 349.766 162.153C424.013 213.814 420.181 181.446 545.325 179.988Z',
    'M528.698 198.843C627.383 197.713 620.802 300.455 571.389 363.567C542.034 403.276 577.408 447.013 545.567 492.695C508.339 546.096 469.99 472.122 417.317 538.98C363.001 606.83 233.66 539.702 253.163 461.455C271.845 386.267 239.416 399.984 209.84 315.683C180.263 231.381 279.434 135.549 353.227 182.55C418.481 227.264 417.583 200.326 528.698 198.843Z',
    'M511.46 217.536C596.394 216.431 593.864 306.994 550.147 362.247C523.36 397.773 553.113 437.409 525.369 477.211C491.159 526.275 458.73 462.511 412.056 519.902C363.409 578.484 248.343 521.999 266.289 450.472C283.251 382.618 253.285 394.928 228.562 320.484C203.839 246.04 289.569 162.276 356.076 202.787C412.338 240.553 414.373 219.046 511.46 217.536Z',
    'M494.188 236.223C565.371 235.142 566.892 313.527 528.872 360.921C504.652 392.264 528.782 427.798 505.135 461.72C473.945 506.447 447.436 452.893 406.761 500.818C363.783 550.132 262.992 504.29 279.381 439.484C294.622 378.962 267.119 389.865 247.25 325.279C227.381 260.693 299.669 188.997 358.891 223.018C406.16 253.836 411.128 237.76 494.188 236.223Z',
    'M476.861 254.896C534.294 253.838 539.866 320.045 507.542 359.58C485.89 386.74 504.399 418.173 484.848 446.214C456.677 486.604 436.089 443.261 401.412 481.72C364.103 521.765 277.587 486.566 292.419 428.48C305.939 375.292 280.9 384.787 265.884 330.059C250.869 275.332 309.716 215.703 361.652 243.234C399.928 267.104 407.83 256.458 476.861 254.896Z',
    'M459.466 273.552C503.148 272.519 512.771 326.547 486.144 358.223C467.059 381.201 479.946 408.531 464.492 430.692C439.34 466.746 424.672 433.613 395.993 462.605C364.354 493.382 292.113 468.825 305.388 417.461C317.187 371.605 294.611 379.693 284.45 334.823C274.288 289.954 319.693 242.393 364.345 263.434C393.627 280.356 404.463 275.141 459.466 273.552Z',
    'M441.96 292.18C471.89 291.171 485.565 333.021 464.635 356.837C448.117 375.633 455.382 398.861 444.025 415.142C421.892 446.859 413.145 423.936 390.464 443.462C364.495 464.971 306.528 451.057 318.246 406.413C328.324 367.891 308.212 374.571 302.904 339.56C297.596 304.548 329.56 269.055 366.926 283.605C387.215 293.58 400.984 293.795 441.96 292.18Z'
];
